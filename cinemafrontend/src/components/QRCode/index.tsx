import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from 'antd';

interface QRCodeProps {
  value: string; // 订单编号
  size?: number; // 二维码大小
  className?: string;
  showDownload?: boolean; // 是否显示下载按钮
}

const QRCodeComponent: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  className,
  showDownload = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
      });
    }
  }, [value, size]);

  const downloadQRCode = async () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `order-${value}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
      {showDownload && (
        <Button
          type="primary"
          size="small"
          onClick={downloadQRCode}
          style={{ marginTop: 8 }}
        >
          下载二维码
        </Button>
      )}
    </div>
  );
};

export default QRCodeComponent; 