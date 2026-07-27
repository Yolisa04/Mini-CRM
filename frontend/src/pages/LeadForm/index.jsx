import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const SOURCES = ['Website', 'Facebook', 'Instagram', 'LinkedIn', 'Referral', 'Google Ads', 'Cold Email', 'Walk In', 'Phone Call'];

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string(),
  message: z.string().optional()
});

const fetchLead = async (id) => {
  const res = await api.get(`/leads/${id}`);
  return res.data.lead;
};

const LeadForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingLead } = useQuery({
    queryKey: ['lead', id, 'form'],
    queryFn: () => fetchLead(id),
    enabled: isEdit
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { source: 'Website' }
  });

  useEffect(() => {
    if (existingLead) {
      reset({
        firstName: existingLead.firstName,
        lastName: existingLead.lastName,
        email: existingLead.email,
        phone: existingLead.phone || '',
        company: existingLead.company || '',
        source: existingLead.source,
        message: existingLead.message || ''
      });
    }
  }, [existingLead, reset]);

  const mutation = useMutation({
    mutationFn: (values) =>
      isEdit ? api.put(`/leads/${id}`, values) : api.post('/leads', values),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      const leadId = isEdit ? id : res.data._id;
      navigate(`/leads/${leadId}`);
    }
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <div className="max-w-2xl">
      <Link to="/leads" className="text-sm text-indigo-600 hover:underline">&larr; Back to leads</Link>
      <h2 className="text-2xl font-bold mt-1 mb-6">{isEdit ? 'Edit lead' : 'Add a new lead'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input {...register('firstName')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input {...register('lastName')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input {...register('company')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select {...register('source')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message / notes</label>
          <textarea {...register('message')} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm">
            {mutation.error?.response?.data?.message || 'Something went wrong saving this lead.'}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create lead'}
          </button>
          <Link to="/leads" className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
