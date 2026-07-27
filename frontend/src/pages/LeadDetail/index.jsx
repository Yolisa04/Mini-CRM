import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];

const statusColors = {
  New: 'bg-blue-100 text-blue-800',
  Contacted: 'bg-orange-100 text-orange-800',
  Qualified: 'bg-purple-100 text-purple-800',
  Proposal: 'bg-teal-100 text-teal-800',
  Negotiation: 'bg-yellow-100 text-yellow-800',
  Converted: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800'
};

const fetchLead = async (id) => {
  const res = await api.get(`/leads/${id}`);
  return res.data;
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id)
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.put(`/leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  const noteMutation = useMutation({
    mutationFn: (note) => api.post(`/leads/${id}/notes`, { note }),
    onSuccess: () => {
      setNoteText('');
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/leads/${id}`),
    onSuccess: () => navigate('/leads')
  });

  if (isLoading) return <div>Loading lead...</div>;
  if (error) return <div className="text-red-600">Could not load this lead.</div>;

  const { lead, notes, activities } = data;

  const handleDelete = () => {
    if (window.confirm('Delete this lead? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    noteMutation.mutate(noteText.trim());
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/leads" className="text-sm text-indigo-600 hover:underline">&larr; Back to leads</Link>
          <h2 className="text-2xl font-bold mt-1">{lead.firstName} {lead.lastName}</h2>
          <p className="text-gray-500">{lead.company || 'No company listed'}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/leads/${id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Contact details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd>{lead.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd>{lead.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Source</dt>
                <dd>{lead.source}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd>{new Date(lead.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
            {lead.message && (
              <div className="mt-4">
                <dt className="text-gray-500 text-sm">Original message</dt>
                <dd className="text-sm mt-1">{lead.message}</dd>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Notes &amp; follow-ups</h3>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a follow-up note..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={noteMutation.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </form>
            <ul className="space-y-3">
              {notes?.length ? notes.map((n) => (
                <li key={n._id} className="text-sm border-l-2 border-indigo-200 pl-3">
                  <p>{n.note}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {n.author?.name || 'Unknown'} &middot; {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              )) : (
                <li className="text-sm text-gray-400">No notes yet.</li>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Activity timeline</h3>
            <ul className="space-y-2">
              {activities?.length ? activities.map((a) => (
                <li key={a._id} className="text-sm text-gray-600">
                  <span className="font-medium">{a.user?.name || 'Someone'}</span>{' '}
                  {a.action.replace('_', ' ')}
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </li>
              )) : (
                <li className="text-sm text-gray-400">No activity recorded yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h3 className="font-semibold mb-4">Status</h3>
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-4 ${statusColors[lead.status]}`}>
            {lead.status}
          </span>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => statusMutation.mutate(s)}
                disabled={s === lead.status || statusMutation.isPending}
                className={`w-full text-left text-sm px-3 py-2 rounded-md border ${
                  s === lead.status
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 cursor-default'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
