import Layout from '@components/Layouts';
import React, { ReactElement } from 'react';

export default function HomePage() {
  return <div>Home Page</div>;
}

HomePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
