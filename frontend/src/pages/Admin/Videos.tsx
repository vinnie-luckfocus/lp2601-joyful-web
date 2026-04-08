import { AdminLayout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const Videos = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">视频管理</h2>
          <p className="text-gray-600 mt-1">管理比赛视频和集锦</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>视频列表</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">视频管理功能即将上线...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Videos;
