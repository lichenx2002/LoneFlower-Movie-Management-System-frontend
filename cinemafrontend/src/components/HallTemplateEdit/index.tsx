import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Modal, message, Typography, Space } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { hallAPI } from '../../api/hallAPI';
import { cinemaAPI } from '../../api/cinemaAPI';
import { Cinema } from '../../types/cinema';

const { Option } = Select;
const { Title } = Typography;

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

const defaultRowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface HallTemplateEditProps {
  onSuccess?: () => void;
}

const HallTemplateEdit: React.FC<HallTemplateEditProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [rowLabels, setRowLabels] = useState(defaultRowLabels.slice(0, 6));
  const [seats, setSeats] = useState<any[][]>([]);
  const [seatTypeModal, setSeatTypeModal] = useState<{ visible: boolean, row: number, col: number }>({ visible: false, row: 0, col: 0 });
  const [bulkSettingModal, setBulkSettingModal] = useState(false);
  const [hallName, setHallName] = useState('');
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);

  useEffect(() => {
    cinemaAPI.getAllCinemas().then(res => {
      setCinemas(res);
      if (res.length > 0) setSelectedCinemaId(res[0].cinemaId);
    });
  }, []);

  // 初始化座位矩阵
  useEffect(() => {
    setRowLabels((prev) => prev.length === rows ? prev : defaultRowLabels.slice(0, rows));
    setSeats(Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({ exists: true, seatType: 'NORMAL' }))
    ));
  }, [rows, cols]);

  // 行标签输入变化
  const handleRowLabelsChange = (val: string) => {
    setRowLabels(val);
    setRows(val.length);
    setSeats(Array.from({ length: val.length }, (_, r) =>
      Array.from({ length: cols }, (_, c) => seats[r]?.[c] || { exists: true, seatType: 'NORMAL' })
    ));
  };

  // 切换有/无座位
  const toggleSeat = (r: number, c: number) => {
    setSeats(prev => prev.map((row, i) =>
      row.map((seat, j) =>
        i === r && j === c ? { ...seat, exists: !seat.exists } : seat
      )
    ));
  };

  // 打开座位类型选择
  const openSeatTypeModal = (r: number, c: number) => {
    setSeatTypeModal({ visible: true, row: r, col: c });
  };

  // 设置座位类型
  const setSeatType = (type: string) => {
    setSeats(prev => prev.map((row, i) =>
      row.map((seat, j) =>
        i === seatTypeModal.row && j === seatTypeModal.col ? { ...seat, seatType: type } : seat
      )
    ));
    setSeatTypeModal({ ...seatTypeModal, visible: false });
  };

  // 一键设置所有座位类型
  const handleBulkSetSeatType = (seatType: string) => {
    setSeats(prev => prev.map(row =>
      row.map(seat => ({ ...seat, seatType }))
    ));
    setBulkSettingModal(false);
    message.success(`已将所有座位设置为${SEAT_TYPES.find(t => t.value === seatType)?.label}`);
  };

  // 提交表单
  const onFinish = async (values: any) => {
    const { type, rowLabels, colCount } = values;
    const name = hallName;
    const seatsArr: any[] = [];
    const cinemaId = selectedCinemaId;
    const rowLabelsArray = Array.isArray(rowLabels) ? rowLabels : rowLabels.split('');
    for (let r = 0; r < rowLabelsArray.length; r++) {
      for (let c = 0; c < colCount; c++) {
        if (seats[r]?.[c]?.exists) {
          seatsArr.push({
            rowLabel: rowLabelsArray[r] || String.fromCharCode(65 + r),
            colNum: c + 1,
            seatType: seats[r][c].seatType
          });
        }
      }
    }
    try {
      await hallAPI.createHallWithSeats({
        name,
        type,
        rowCount: rowLabelsArray.length,
        colCount,
        rowLabels: rowLabelsArray.join(''),
        seats: seatsArr,
        cinemaId
      });
      message.success('影厅及座位模板创建成功！');
      form.resetFields();
      setHallName('');
      setRows(6);
      setCols(6);
      setRowLabels(defaultRowLabels.slice(0, 6));
      setSeats(Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => ({ exists: true, seatType: 'NORMAL' }))));
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      message.error('创建失败，请重试');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Title level={3}>新增影厅及座位模板</Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: '', type: 'LARGE', rowLabels: rowLabels, colCount: cols }}
        onFinish={onFinish}
      >
        <Form.Item label="所属影院" required>
          <Select
            value={selectedCinemaId ?? undefined}
            onChange={val => setSelectedCinemaId(val)}
            options={cinemas.map(c => ({ label: c.name, value: c.cinemaId }))}
            placeholder="请选择影院"
          />
        </Form.Item>
        <Form.Item label="影厅名称" name="name" rules={[{ required: true, message: '请输入影厅名称' }]}>
          <Input value={hallName} onChange={e => setHallName(e.target.value)} />
        </Form.Item>
        <Form.Item label="影厅类型" name="type" rules={[{ required: true }]}>
          <Select options={HALL_TYPES} />
        </Form.Item>
        <Form.Item label="总列数" name="colCount" rules={[{ required: true }]}>
          <InputNumber
            min={1}
            max={30}
            value={cols}
            onChange={v => {
              const newCols = Number(v);
              setCols(newCols);
              form.setFieldsValue({ colCount: newCols });
            }}
          />
        </Form.Item>
        <Form.Item label="自定义排号字母（如ABCDEF）" name="rowLabels" rules={[{ required: true }]}>
          <Input
            value={rowLabels}
            onChange={e => {
              const newRowLabels = e.target.value.replace(/[^A-Z]/g, '');
              handleRowLabelsChange(newRowLabels);
              form.setFieldsValue({ rowLabels: newRowLabels });
            }}
            maxLength={26}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button
              type="default"
              icon={<SettingOutlined />}
              onClick={() => setBulkSettingModal(true)}
            >
              一键设置座位类别
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <div style={{ margin: '32px 0' }}>
        <Title level={5}>座位布局（点击切换有/无，右键设置类型）</Title>
        <div style={{ display: 'inline-block', border: '1px solid #eee', padding: 12, background: '#fafafa' }}>
          {Array.from({ length: rowLabels.length }).map((_, r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 24, display: 'inline-block', textAlign: 'center', fontWeight: 600 }}>{rowLabels[r]}</span>
              {Array.from({ length: cols }).map((_, c) => (
                <div
                  key={c}
                  style={{
                    width: 32, height: 32, margin: 2, borderRadius: 4, border: '1px solid #bbb',
                    background: seats[r]?.[c]?.exists ? '#52c41a' : '#fff',
                    color: seats[r]?.[c]?.exists ? '#fff' : '#bbb',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleSeat(r, c)}
                  onContextMenu={e => { e.preventDefault(); if (seats[r]?.[c]?.exists) openSeatTypeModal(r, c); }}
                  title={seats[r]?.[c]?.exists ? SEAT_TYPES.find(t => t.value === seats[r][c].seatType)?.label : '无座位'}
                >
                  {seats[r]?.[c]?.exists ? (seats[r][c].seatType === 'NORMAL' ? '' : seats[r][c].seatType) : <PlusOutlined />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 座位类型选择模态框 */}
      <Modal
        open={seatTypeModal.visible}
        title="选择座位类型"
        onCancel={() => setSeatTypeModal({ ...seatTypeModal, visible: false })}
        footer={null}
      >
        <Select style={{ width: '100%' }} value={seats[seatTypeModal.row]?.[seatTypeModal.col]?.seatType} onChange={setSeatType}>
          {SEAT_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
        </Select>
      </Modal>

      {/* 一键设置座位类别模态框 */}
      <Modal
        title="一键设置座位类别"
        open={bulkSettingModal}
        onCancel={() => setBulkSettingModal(false)}
        footer={null}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: 20, color: '#666' }}>
            选择要设置的座位类型，将应用到所有座位：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {SEAT_TYPES.map(seatType => (
              <Button
                key={seatType.value}
                size="large"
                onClick={() => handleBulkSetSeatType(seatType.value)}
                style={{ height: 50, fontSize: 14 }}
              >
                {seatType.label}
              </Button>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              💡 此操作只修改当前表格显示，点击"提交"按钮后才会保存到数据库。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HallTemplateEdit; 