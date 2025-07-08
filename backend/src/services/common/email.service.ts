import nodemailer from 'nodemailer';
import logger from './logger.service';
import {emailConfigs, frontendUrl} from "../../config/constant";
import QRCode from 'qrcode';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        cid?: string;
    }>;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: emailConfigs.host,
            port: emailConfigs.port,
            secure: false,
            auth: {
                user: emailConfigs.user,
                pass: emailConfigs.password,
            },
        });
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: emailConfigs.user,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
            };

            const result = await this.transporter.sendMail(mailOptions);
            logger.info('Email sent successfully', {
                messageId: result.messageId,
                to: options.to,
                subject: options.subject
            });
            return true;
        } catch (error) {
            logger.error('Failed to send email', {
                error,
                to: options.to,
                subject: options.subject
            });
            return false;
        }
    }

    async sendContractInvitation(email: string, contractName: string, inviterName: string, plainPassword: string, invitationToken: string): Promise<boolean> {
        const signupUrl = `${frontendUrl}`;

        const subject = `You've been invited to sign a contract: ${contractName}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Contract Invitation</h2>
                
                <p>Hello,</p>
                
                <p><strong>${inviterName}</strong> has invited you to sign a contract titled "<strong>${contractName}</strong>".</p>
                
                <p>To proceed with signing this contract, you need to create an account first:</p>
                <p>Temporary Password: ${plainPassword}</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${signupUrl}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Create Account & View Contract
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${signupUrl}">${signupUrl}</a>
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This invitation will expire in 7 days. If you have any questions, 
                    please contact ${inviterName} directly.
                </p>
            </div>
        `;

        const text = `
            You've been invited to sign a contract: ${contractName}
            
            ${inviterName} has invited you to sign a contract. To proceed, please create an account by visiting:
            ${signupUrl}
            
            This invitation will expire in 7 days.
        `;

        return await this.sendEmail({
            to: email,
            subject,
            html,
            text
        });
    }

    async sendContractBulk(
        recipients: Array<{email: string, name: string}>,
        contractName: string,
        contractId: number,
    ): Promise<boolean> {
        try {
            const recipientEmails = recipients.map(r => r.email).join(', ');
            const subject = `Contract Created: ${contractName}`;

            const html = `
                <p>Hello,</p>

                <p>You have been assigned to the contract "<strong>${contractName}</strong>".</p>
                
                <p>Please review the contract details and complete any required actions:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${frontendUrl}/contracts/${contractId}"
                       style="background-color: #007bff; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Contract
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${frontendUrl}/contracts/${contractId}">${frontendUrl}/contracts/${contractId}</a>
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Please ensure you complete all required actions within the specified timeframe.
                </p>
            `;

            const text = `
                Contract: ${contractName}
                                
                You can access the contract at: ${frontendUrl}/contract/${contractId}
            `;

            return await this.sendEmail({
                to: recipientEmails,
                subject,
                html,
                text
            });
        } catch (error) {
            logger.error('Failed to generate or send bulk QR code', {
                error,
                recipients: recipients.map(r => r.email)
            });
            return false;
        }
    }
}

export default new EmailService();
