import { AdminLayout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const Players = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">队员管理</h2>
          <p className="text-gray-600 mt-1">管理队员信息和档案</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>队员列表</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">队员管理功能即将上线...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Players;
