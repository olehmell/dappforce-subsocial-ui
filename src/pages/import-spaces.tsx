import dynamic from 'next/dynamic';
const Import = dynamic(() => import('../components/uploader/ImportSpaces'), { ssr: false });

export default Import;
