import { AdminLayout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const Stats = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">数据录入</h2>
          <p className="text-gray-600 mt-1">录入和管理比赛统计数据</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>统计数据</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">数据录入功能即将上线...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Stats;
