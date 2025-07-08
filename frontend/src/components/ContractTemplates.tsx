
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Eye } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  sriLankanLaw: boolean;
  category: string;
}

interface ContractTemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const ContractTemplates: React.FC<ContractTemplatesProps> = ({ open, onClose, onSelectTemplate }) => {
  const templates: Template[] = [
    {
      id: '1',
      name: 'Employment Agreement (Sri Lanka)',
      type: 'Employment Agreement',
      description: 'Standard employment contract compliant with Sri Lankan labor laws',
      sriLankanLaw: true,
      category: 'Employment'
    },
    {
      id: '2',
      name: 'Service Agreement',
      type: 'Service Agreement',
      description: 'Professional service agreement for consultants and contractors',
      sriLankanLaw: true,
      category: 'Business'
    },
    {
      id: '3',
      name: 'Non-Disclosure Agreement',
      type: 'Non-Disclosure Agreement',
      description: 'Confidentiality agreement for protecting sensitive information',
      sriLankanLaw: false,
      category: 'Legal'
    },
    {
      id: '4',
      name: 'Partnership Agreement (Sri Lanka)',
      type: 'Partnership Agreement',
      description: 'Business partnership agreement under Sri Lankan company law',
      sriLankanLaw: true,
      category: 'Business'
    },
    {
      id: '5',
      name: 'Lease Agreement (Residential)',
      type: 'Lease Agreement',
      description: 'Residential property lease agreement for Sri Lankan properties',
      sriLankanLaw: true,
      category: 'Real Estate'
    },
    {
      id: '6',
      name: 'Purchase Agreement',
      type: 'Purchase Agreement',
      description: 'Asset purchase agreement with escrow provisions',
      sriLankanLaw: false,
      category: 'Sales'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Contract Templates
          </DialogTitle>
          <DialogDescription>
            Choose from our collection of pre-built legal contract templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">{category}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {templates
                  .filter(template => template.category === category)
                  .map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          {template.sriLankanLaw && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Sri Lankan Law
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => console.log('Preview template:', template.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => onSelectTemplate(template)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractTemplates;
