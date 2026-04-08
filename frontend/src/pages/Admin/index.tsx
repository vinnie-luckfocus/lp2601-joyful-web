import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import api from '../../utils/axios';

interface DashboardStats {
  teams: number;
  players: number;
  games: number;
  videos: number;
}

const Admin = () => {
  const [stats, setStats] = useState<DashboardStats>({
    teams: 0,
    players: 0,
    games: 0,
    videos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, playersRes, gamesRes] = await Promise.all([
          api.get('/teams'),
          api.get('/players'),
          api.get('/games'),
        ]);

        setStats({
          teams: teamsRes.data.length || 0,
          players: playersRes.data.length || 0,
          games: gamesRes.data.length || 0,
          videos: 0, // Will be implemented when video API is ready
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Admin Panel</h2>
          <p className="text-gray-600 mt-1">Manage your baseball league from this dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-mlb-navy">
                {loading ? '...' : stats.teams}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-mlb-navy">
                {loading ? '...' : stats.players}
              </div>
              <p className="text-xs text-gray-500 mt-1">Registered players</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-mlb-navy">
                {loading ? '...' : stats.games}
              </div>
              <p className="text-xs text-gray-500 mt-1">Scheduled games</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-mlb-red">
                {loading ? '...' : stats.videos}
              </div>
              <p className="text-xs text-gray-500 mt-1">Uploaded videos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/teams"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-mlb-navy/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-mlb-navy/10 flex items-center justify-center">
                  <span className="text-mlb-navy font-semibold">T</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Manage Teams</p>
                  <p className="text-xs text-gray-500">Add or edit teams</p>
                </div>
              </a>

              <a
                href="/admin/players"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-mlb-navy/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">P</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Manage Players</p>
                  <p className="text-xs text-gray-500">Roster management</p>
                </div>
              </a>

              <a
                href="/admin/games"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-mlb-navy/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-mlb-red/10 flex items-center justify-center">
                  <span className="text-mlb-red font-semibold">G</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Manage Games</p>
                  <p className="text-xs text-gray-500">Schedule games</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Admin;
