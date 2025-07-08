import { Request, Response } from 'express';
import client from "../../../services/database/prisma.service";
import logger from "../../../services/common/logger.service";
import emailService from "../../../services/common/email.service";
import crypto from 'crypto';
import bcrypt from "bcrypt";
import {emailConfigs} from "../../../config/constant";

export default class ContractController {

    public async verifyUser(request: Request, res: Response): Promise<any> {
        try {
            const {walletAddress} = request.body;
            const id = request.user!.uid;

            const user = await client.prisma.user.findUnique({
                where: { id },
            });

            if (user!.walletAddress != walletAddress) {
                logger.error('Wallet address does not match', { userId: id, walletAddress });
                return res.status(403).json({ error: 'Forbidden: Wallet address does not match' });
            }

            return res.status(200).json({
                message: "User verified successfully",
                user: {
                    id: user!.id,
                    name: user!.name,
                    email: user!.email
                }
            })
        } catch (error) {
            logger.error('Error verifying user', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async create(req: Request, res: Response): Promise<any> {
        try {
            const { name, description, type, signers, transactionHash, walletAddress } = req.body;
            const id = req.user!.uid;
            const documentFile = req.file;
            const createdBy = req.user!.uid;
            const signersArray = signers ? JSON.parse(signers) : [];
            const signersEmailArray = signersArray.map((signer: any) => signer.email);

            if (!name || !type || !documentFile || !transactionHash || !createdBy || !walletAddress || !Array.isArray(signersArray)) {
                return res.status(400).json({
                    error: 'Missing required fields: name, type, document (file), transactionHash, createdBy, walletAddress, contractAddress'
                });
            }

            const user = await client.prisma.user.findUnique({
                where: { id },
            });

            if (user!.walletAddress != walletAddress) {
                logger.error('Wallet address does not match', { userId: id, walletAddress });
                return res.status(403).json({ error: 'Forbidden: Wallet address does not match' });
            }

            const documentBuffer = documentFile.buffer;
            const result = await client.prisma.$transaction(async (prisma: any) => {

                const contract = await prisma.contract.create({
                    data: {
                        name,
                        description,
                        type,
                        document: documentBuffer,
                        transactionHash,
                        createdBy,
                        status: 'draft'
                    }
                });

                if (signersArray && Array.isArray(signersArray) && signersArray.length > 0) {
                    const existingSigners = await prisma.user.findMany({
                        where: {
                            email: { in: signersEmailArray }
                        },
                        select: { email: true, id: true }
                    });
                    const existingSignerEmails = existingSigners.map((signer: any) => signer.email);
                    const newSigners = signersArray.filter((signer: any) => !existingSignerEmails.includes(signer.email));

                    const newSignersWithPasswords = [];
                    for (const signer of newSigners) {
                        const plainPassword = this.generateRandomPassword();
                        const hashedPassword = await bcrypt.hash(plainPassword, 10)

                        const signerData = {
                            email: signer.email,
                            walletAddress: signer.walletAddress,
                            plainPassword,
                            password: hashedPassword
                        };

                        newSignersWithPasswords.push(signerData);
                        await emailService.sendContractInvitation(signer.email, contract.name, req.user!.name ?? 'A member', plainPassword, '');

                        await prisma.user.createMany({
                            data: newSignersWithPasswords.map(signer => ({
                                email: signer.email,
                                name: signer.email,
                                password: signer.password,
                                walletAddress: signer.walletAddress
                            }))
                        });
                    }

                    const newUserIds = await prisma.user.findMany({
                        where: {
                            email: { in: newSignersWithPasswords.map(signer => signer.email) }
                        },
                        select: { id: true, email: true }
                    });
                    const dbSigners = [...existingSigners, ...newUserIds];

                    await prisma.contractSigner.createMany({
                        data: dbSigners.map((signer: {id: number}) => ({
                            contractId: contract.id,
                            userId: signer.id,
                            status: 'pending'
                        }))
                    });
                }

                return prisma.contract.findUnique({
                    where: {id: contract.id},
                    include: {
                        creator: {
                            select: {id: true, name: true, email: true, walletAddress: true}
                        },
                        signers: {
                            include: {
                                user: {
                                    select: {id: true, name: true, email: true, walletAddress: true}
                                }
                            }
                        }
                    }
                });
            }, {timeout: 10000});

            try {
                const allRecipients = [];

                const creatorUser = await client.prisma.user.findUnique({
                    where: { id: createdBy },
                    select: { name: true, email: true }
                });

                if (creatorUser) {
                    allRecipients.push({
                        email: creatorUser.email,
                        name: creatorUser.name || 'Creator'
                    });
                }

                for (const signer of result!.signers) {
                    allRecipients.push({
                        email: signer.user.email,
                        name: signer.user.name || 'Signer'
                    });
                }

                if (allRecipients.length) {
                    await emailService.sendContractBulk(
                        allRecipients,
                        name,
                        result!.id
                    );
                    logger.info('Contract to all participants', {
                        contractId: result!.id,
                        recipientCount: allRecipients.length,
                        recipients: allRecipients.map(r => r.email)
                    });
                }
            } catch (qrError) {
                logger.error('Error sending mails', {
                    contractId: result!.id,
                    error: qrError
                });
            }

            return res.status(201).json({
                message: "Contract created successfully and sent to all participants",
                contract: {
                    ...(() => {
                        const { document, ...contractWithoutDocument } = result!;
                        return contractWithoutDocument;
                    })(),
                    documentInfo: {
                        originalName: documentFile.originalname,
                        mimeType: documentFile.mimetype,
                        size: documentFile.size
                    }
                },
            });
        } catch (error) {
            logger.error('Error creating contract', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getAll(req: Request, res: Response): Promise<any> {
        try {
            const { page = 1, limit = 10, status, createdBy } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (status) where.status = status;
            if (createdBy) where.createdBy = Number(createdBy);

            const [contracts, total] = await Promise.all([
                client.prisma.contract.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        creator: {
                            select: { id: true, name: true, email: true, walletAddress: true }
                        },
                        signers: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, walletAddress: true }
                                }
                            }
                        }
                    }
                }),
                client.prisma.contract.count({ where })
            ]);

            // Convert document BLOBs to base64 for response
            const contractsWithBase64 = contracts.map((contract: any) => ({
                ...contract,
                document: contract.document.toString('base64')
            }));

            return res.status(200).json({
                message: "Contracts retrieved successfully",
                contracts: contractsWithBase64,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Error retrieving contracts', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const contractId = parseInt(id);

            if (isNaN(contractId)) {
                return res.status(400).json({ error: 'Invalid contract ID' });
            }

            const contract = await client.prisma.contract.findUnique({
                where: { id: contractId },
                include: {
                    creator: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    },
                    signers: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, walletAddress: true }
                            }
                        },
                        orderBy: { signedAt: 'asc' }
                    }
                }
            });

            if (!contract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            const signedSigners = contract.signers.filter(signer => signer.status === 'signed' && signer.transactionHash);
            let latestTransactionHash = contract.transactionHash; // Default to original contract hash

            if (signedSigners.length) {
                const latestSigner = signedSigners[signedSigners.length - 1];
                latestTransactionHash = latestSigner.transactionHash!;
            }

            return res.status(200).json({
                message: "Contract retrieved successfully",
                contract: {
                    ...(() => {
                        const { document, ...contractWithoutDocument } = contract!;
                        return contractWithoutDocument;
                    })(),
                    latestTransactionHash
                },
            });
        } catch (error) {
            logger.error('Error retrieving contract', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getDocumentById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const contractId = parseInt(id);

            if (isNaN(contractId)) {
                return res.status(400).json({ error: 'Invalid contract ID' });
            }

            const contract = await client.prisma.contract.findUnique({
                where: { id: contractId },
                select: {
                    id: true,
                    name: true,
                    document: true,
                }
            });

            if (!contract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            if (!contract.document) {
                return res.status(404).json({ error: 'Document not found for this contract' });
            }

            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${contract.name}_contract.pdf"`,
                'Content-Length': contract.document.length.toString()
            });

            return res.send(contract.document);
        } catch (error) {
            logger.error('Error retrieving contract document', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async delete(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const contractId = parseInt(id);

            if (isNaN(contractId)) {
                return res.status(400).json({ error: 'Invalid contract ID' });
            }

            const existingContract = await client.prisma.contract.findUnique({
                where: { id: contractId }
            });

            if (!existingContract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            await client.prisma.contract.delete({
                where: { id: contractId }
            });

            return res.status(200).json({
                message: "Contract deleted successfully",
            });
        } catch (error) {
            logger.error('Error deleting contract', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async sign(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const contractId = parseInt(id);
            const userId = req.user!.uid;

            const contract = await client.prisma.contract.findUnique({
                where: { id: contractId },
                include: {
                    creator: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    },
                    signers: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, walletAddress: true }
                            }
                        },
                        orderBy: { signedAt: 'asc' }
                    }
                }
            });

            if (!contract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            const contractSign = contract.signers.find((signer: any) => signer.userId === userId);
            if (!contractSign) {
                return res.status(404).json({ error: 'Contract not found for this user' });
            }

            const signedSigners = contract.signers.filter((signer: any) => signer.status === 'signed' && signer.transactionHash);
            let latestTransactionHash = contract.transactionHash;

            if (signedSigners.length) {
                const latestSigner = signedSigners[signedSigners.length - 1];
                latestTransactionHash = latestSigner.transactionHash!;
            }

            const updateDate = {
                parentTransactionHash: latestTransactionHash,
                transactionHash: req.body.transactionHash,
                signedAt: new Date(),
                status: 'signed',
                updatedAt: new Date(),
            }
            const updatedData = await client.prisma.contractSigner.update({
                where: { id: contractSign.id },
                data: updateDate
            });

            return res.status(200).json({
                message: "Contract signed successfully",
                updatedData
            });
        } catch (error) {
            logger.error('Error signing contract', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getByTransactionHash(req: Request, res: Response): Promise<any> {
        try {
            const { transactionHash } = req.params;

            const contract = await client.prisma.contract.findUnique({
                where: { transactionHash },
                include: {
                    creator: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    },
                    signers: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, walletAddress: true }
                            }
                        }
                    }
                }
            });

            if (!contract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            return res.status(200).json({
                message: "Contract retrieved successfully",
                contract: {
                    ...contract,
                    document: contract.document.toString('base64')
                },
            });
        } catch (error) {
            logger.error('Error retrieving contract by transaction hash', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Contract Signer Management Methods
    public async addSigner(req: Request, res: Response): Promise<any> {
        try {
            const { contractId } = req.params;
            const { userId } = req.body;
            const contractIdNum = parseInt(contractId);

            if (isNaN(contractIdNum)) {
                return res.status(400).json({ error: 'Invalid contract ID' });
            }

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Check if contract exists
            const contract = await client.prisma.contract.findUnique({
                where: { id: contractIdNum }
            });

            if (!contract) {
                return res.status(404).json({ error: 'Contract not found' });
            }

            // Check if user is already a signer
            const existingSigner = await client.prisma.contractSigner.findUnique({
                where: {
                    contractId_userId: {
                        contractId: contractIdNum,
                        userId: userId
                    }
                }
            });

            if (existingSigner) {
                return res.status(400).json({ error: 'User is already a signer for this contract' });
            }

            const contractSigner = await client.prisma.contractSigner.create({
                data: {
                    contractId: contractIdNum,
                    userId: userId,
                    status: 'pending'
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    },
                    contract: {
                        select: { id: true, name: true, type: true }
                    }
                }
            });

            return res.status(201).json({
                message: "Signer added successfully",
                contractSigner
            });
        } catch (error) {
            logger.error('Error adding signer', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async removeSigner(req: Request, res: Response): Promise<any> {
        try {
            const { contractId, userId } = req.params;
            const contractIdNum = parseInt(contractId);
            const userIdNum = parseInt(userId);

            if (isNaN(contractIdNum) || isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid contract ID or user ID' });
            }

            const contractSigner = await client.prisma.contractSigner.findUnique({
                where: {
                    contractId_userId: {
                        contractId: contractIdNum,
                        userId: userIdNum
                    }
                }
            });

            if (!contractSigner) {
                return res.status(404).json({ error: 'Contract signer not found' });
            }

            await client.prisma.contractSigner.delete({
                where: {
                    contractId_userId: {
                        contractId: contractIdNum,
                        userId: userIdNum
                    }
                }
            });

            return res.status(200).json({
                message: "Signer removed successfully"
            });
        } catch (error) {
            logger.error('Error removing signer', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async signContract(req: Request, res: Response): Promise<any> {
        try {
            const { contractId, userId } = req.params;
            const { transactionHash, parentTransactionHash } = req.body;
            const contractIdNum = parseInt(contractId);
            const userIdNum = parseInt(userId);

            if (isNaN(contractIdNum) || isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid contract ID or user ID' });
            }

            const contractSigner = await client.prisma.contractSigner.findUnique({
                where: {
                    contractId_userId: {
                        contractId: contractIdNum,
                        userId: userIdNum
                    }
                }
            });

            if (!contractSigner) {
                return res.status(404).json({ error: 'Contract signer not found' });
            }

            if (contractSigner.status === 'signed') {
                return res.status(400).json({ error: 'Contract already signed by this user' });
            }

            const updatedSigner = await client.prisma.contractSigner.update({
                where: {
                    contractId_userId: {
                        contractId: contractIdNum,
                        userId: userIdNum
                    }
                },
                data: {
                    status: 'signed',
                    signedAt: new Date(),
                    transactionHash: transactionHash,
                    parentTransactionHash: parentTransactionHash
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    },
                    contract: {
                        select: { id: true, name: true, type: true }
                    }
                }
            });

            return res.status(200).json({
                message: "Contract signed successfully",
                contractSigner: updatedSigner
            });
        } catch (error) {
            logger.error('Error signing contract', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getContractSigners(req: Request, res: Response): Promise<any> {
        try {
            const { contractId } = req.params;
            const contractIdNum = parseInt(contractId);

            if (isNaN(contractIdNum)) {
                return res.status(400).json({ error: 'Invalid contract ID' });
            }

            const signers = await client.prisma.contractSigner.findMany({
                where: { contractId: contractIdNum },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    }
                },
                orderBy: { createdAt: 'asc' }
            });

            return res.status(200).json({
                message: "Contract signers retrieved successfully",
                signers
            });
        } catch (error) {
            logger.error('Error retrieving contract signers', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getSignerStatus(req: Request, res: Response): Promise<any> {
        try {
            const { contractId, userId } = req.params;
            const contractIdNum = parseInt(contractId);
            const userIdNum = parseInt(userId);

            if (isNaN(contractIdNum) || isNaN(userIdNum)) {
                return res.status(400).json({ error: 'Invalid contract ID or user ID' });
            }

            const signer = await client.prisma.contractSigner.findUnique({
                where: {
                    contractId_userId: {
                        contractId: contractIdNum,
                        userId: userIdNum
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    }
                }
            });

            if (!signer) {
                return res.status(404).json({ error: 'Signer not found for this contract' });
            }

            return res.status(200).json({
                message: "Signer status retrieved successfully",
                signer
            });
        } catch (error) {
            logger.error('Error retrieving signer status', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getByUserId(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user!.uid;

            const contracts = await client.prisma.contract.findMany({
                where: {
                    OR: [
                        { createdBy: userId },
                        { signers: { some: { userId: userId } } }
                    ]
                },
                include: {
                    creator: {
                        select: { id: true, name: true, email: true, walletAddress: true }
                    },
                    signers: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, walletAddress: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const contractsWithoutDocuments = contracts.map(contract => {
                const { document, ...contractWithoutDocument } = contract;
                return contractWithoutDocument;
            });

            return res.status(200).json({
                message: "Contracts retrieved successfully",
                contracts: contractsWithoutDocuments
            });
        } catch (error) {
            logger.error('Error retrieving contracts by user ID', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    private generateRandomPassword(length = 16): string {
        return crypto.randomBytes(length)
            .toString('base64')
            .slice(0, length);
    }
}
