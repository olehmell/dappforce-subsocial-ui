import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';
import { showSuccessMessage, showErrorMessage } from '../utils/Message';

type DragDropProps = Omit<DraggerProps, 'onChange'> & {
  onChange: (file: File | Blob) => void,
}

export const DragDrop = ({ onChange, accept, ...props }: DragDropProps) => {
  return <Dragger
    {...props}
    accept={accept}
    listType='text'
    onChange={(info) => {
      const { status } = info.file;
      if (status === 'done') {
        showSuccessMessage(`${info.file.name} file uploaded successfully.`);
        onChange && info.file.originFileObj && onChange(info.file.originFileObj)
      } else if (status === 'error') {
        showErrorMessage(`${info.file.name} file upload failed.`);
      }
    }
    }>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">{'Click or drag file to this area to upload'}</p>
  </Dragger>
}
