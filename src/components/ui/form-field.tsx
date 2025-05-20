import React from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  label: string;
  id: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, id }) => {
  return (
    <FormItem>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Input id={id} />
    </FormItem>
  );
};

export default FormField;