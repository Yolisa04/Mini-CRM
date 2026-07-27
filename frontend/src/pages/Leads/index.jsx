import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];

const fetchLeads = async (params) => {
  const res = await api.get('/leads', { params });
  return res.data;
};

const statusColors = {
  New: 'bg-blue-100 text-blue-800',
  Contacted: 'bg-orange-100 text-orange-800',
  Qualified: 'bg-purple-100 text-purple-800',
  Proposal: 'bg-teal-100 text-teal-800',
  Negotiation: 'bg-yellow-100 text-yellow-800',
  Converted: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800'
};

const Leads = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', search, status],
    queryFn: () => fetchLeads({ search: search || undefined, status: status || undefined })
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leads</h2>
        <Link
          to="/leads/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          + Add Lead
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && <div>Loading leads...</div>}
      {error && <div className="text-red-600">Could not load leads.</div>}

      {data && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                    No leads match your filters yet.
                  </td>
                </tr>
              )}
              {data.leads.map((lead) => (
                <tr key={lead._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/leads/${lead._id}`} className="text-indigo-600 hover:underline">
                      {lead.firstName} {lead.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.company || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/leads/${lead._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      View
                    </Link>
                    <Link to={`/leads/${lead._id}/edit`} className="text-gray-600 hover:text-gray-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leads;
