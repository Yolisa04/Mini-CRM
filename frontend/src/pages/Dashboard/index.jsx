import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  UsersIcon, 
  UserPlusIcon, 
  PhoneIcon, 
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

const fetchStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats
  });

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Error loading stats</div>;

  const stats = [
    { name: 'Total Leads', value: data.total, icon: UsersIcon, color: 'bg-blue-500' },
    { name: 'New Leads', value: data.newLeads, icon: UserPlusIcon, color: 'bg-indigo-500' },
    { name: 'Contacted', value: data.contacted, icon: PhoneIcon, color: 'bg-yellow-500' },
    { name: 'Converted', value: data.converted, icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Lost', value: data.lost, icon: XCircleIcon, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <h3 className="font-semibold mb-2">Conversion Rate</h3>
        <p className="text-2xl">{data.conversionRate}%</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <ul className="divide-y divide-gray-200">
          {data.recentActivity?.map((activity) => (
            <li key={activity._id} className="py-2 text-sm">
              <span className="font-medium">{activity.user?.name}</span> 
              {' '}{activity.action}{' '}
              {activity.leadId && (
                <span className="text-blue-600">
                  {activity.leadId.firstName} {activity.leadId.lastName}
                </span>
              )}
              <span className="text-gray-400 text-xs ml-2">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
