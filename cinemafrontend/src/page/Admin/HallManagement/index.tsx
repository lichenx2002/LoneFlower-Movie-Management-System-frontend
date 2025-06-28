import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Typography, Input, Select, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { hallAPI } from '../../../api/hallAPI';
import HallTemplateEdit from '../../../components/HallTemplateEdit';
import { debounce } from '../../../utils/performance';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const HALL_TYPES = [
  { label: '大型厅', value: 'LARGE' },
  { label: '中型厅', value: 'MEDIUM' },
  { label: '小型厅', value: 'SMALL' },
  { label: '情侣厅', value: 'LOVERS' },
];

const SEAT_TYPES = [
  { label: '普通', value: 'NORMAL' },
  { label: '情侣左', value: 'L_L' },
  { label: '情侣右', value: 'L_R' },
  { label: 'VIP', value: 'VIP' },
];

interface Hall {
  hallId: number;
  name: string;
  type: string;
  rowCount: number;
  colCount: number;
  rowLabels: string;
}

const HallManagement: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState<string>('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [seatSettingModalVisible, setSeatSettingModalVisible] = useState(false);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);

  // 获取影厅列表
  const fetchHalls = async (params = {}) => {
    setLoading(true);
    try {
      const response: any = await hallAPI.getHallList({
        current: pagination.current,
        size: pagination.pageSize,
        name: searchText,
        type: searchType,
        ...params,
      });

      // 直接处理Page对象（StatusHandler已经解析了JSON）
      if (response && response.records) {
        setHalls(response.records);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
        }));
      } else {
        console.error('响应数据格式异常:', response);
        setHalls([]);
      }
    } catch (error) {
      message.error('获取影厅列表失败');
      console.error('获取影厅列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 防抖搜索
  const debouncedSearch = debounce((value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchHalls({ name: value, current: 1 });
  }, 500);

  // 删除影厅
  const handleDelete = async (id: number) => {
    try {
      await hallAPI.deleteHall(id);
      message.success('删除成功');
      fetchHalls();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 添加影厅成功回调
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchHalls();
  };

  // 打开座位设置模态框
  const showSeatSettingModal = (hall: Hall) => {
    setSelectedHall(hall);
    setSeatSettingModalVisible(true);
  };

  // 关闭座位设置模态框
  const handleSeatSettingCancel = () => {
    setSeatSettingModalVisible(false);
    setSelectedHall(null);
  };

  // 一键设置座位类别（调用后端API）
  const handleBulkSeatSetting = async (seatType: string) => {
    if (!selectedHall) return;

    try {
      await hallAPI.bulkSetSeatType(selectedHall.hallId, seatType);

      const seatTypeLabel = SEAT_TYPES.find(t => t.value === seatType)?.label;
      message.success(`已将${selectedHall.name}的所有座位设置为${seatTypeLabel}`);

      handleSeatSettingCancel();
    } catch (error) {
      message.error('设置失败，请重试');
      console.error('设置座位类型错误:', error);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const columns = [
    {
      title: '影厅ID',
      dataIndex: 'hallId',
      key: 'hallId',
      width: 80,
    },
    {
      title: '影厅名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '影厅类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => HALL_TYPES.find(t => t.value === type)?.label || type,
    },
    {
      title: '行数',
      dataIndex: 'rowCount',
      key: 'rowCount',
      width: 80,
    },
    {
      title: '列数',
      dataIndex: 'colCount',
      key: 'colCount',
      width: 80,
    },
    {
      title: '行标签',
      dataIndex: 'rowLabels',
      key: 'rowLabels',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Hall) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => message.info('编辑功能开发中...')}
            />
          </Tooltip>
          <Tooltip title="设置座位类别">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => showSeatSettingModal(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个影厅吗？"
              onConfirm={() => handleDelete(record.hallId)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>影厅管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
        >
          添加影厅
        </Button>
      </div>

      {/* 搜索栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索影厅名称"
          allowClear
          style={{ width: 300 }}
          onChange={(e) => debouncedSearch(e.target.value)}
          onSearch={debouncedSearch}
        />
        <Select
          placeholder="选择影厅类型"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => {
            setSearchType(value);
            setPagination(prev => ({ ...prev, current: 1 }));
            fetchHalls({ type: value, current: 1 });
          }}
        >
          {HALL_TYPES.map(type => (
            <Option key={type.value} value={type.value}>{type.label}</Option>
          ))}
        </Select>
      </div>

      {/* 影厅列表表格 */}
      <Table
        columns={columns}
        dataSource={halls}
        rowKey="hallId"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            fetchHalls({ current: page, size: pageSize });
          },
        }}
      />

      {/* 添加影厅模态框 */}
      <Modal
        title="添加影厅及座位模板"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <HallTemplateEdit onSuccess={handleAddSuccess} />
      </Modal>

      {/* 座位设置模态框 */}
      <Modal
        title={`设置座位类别 - ${selectedHall?.name}`}
        open={seatSettingModalVisible}
        onCancel={handleSeatSettingCancel}
        footer={null}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: 20, color: '#666' }}>
            选择要设置的座位类型，将应用到该影厅的所有座位：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {SEAT_TYPES.map(seatType => (
              <Button
                key={seatType.value}
                size="large"
                onClick={() => handleBulkSeatSetting(seatType.value)}
                style={{ height: 60, fontSize: 16 }}
              >
                {seatType.label}
              </Button>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
              💡 <strong>提示：</strong>此功能用于快速设置所有座位为同一类型。如需精细调整个别座位，请使用影厅模板编辑功能。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HallManagement; 