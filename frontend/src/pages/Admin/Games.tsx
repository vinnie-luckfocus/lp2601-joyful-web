import { AdminLayout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const Games = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">赛程管理</h2>
          <p className="text-gray-600 mt-1">管理比赛日程和赛程安排</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>赛程列表</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">赛程管理功能即将上线...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Games;
