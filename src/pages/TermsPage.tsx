import Layout from '@/components/Layout';

const TermsPage = () => (
  <Layout>
    <div className="container mx-auto px-4 py-8 prose">
      <h1>Terms and Conditions</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        This is placeholder content. Replace with your real terms and
        conditions before going live.
      </p>
    </div>
  </Layout>
);

export default TermsPage; 