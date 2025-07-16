import Layout from '@/components/Layout';

const PrivacyPage = () => (
  <Layout>
    <div className="container mx-auto px-4 py-8 prose">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        This is placeholder content. Replace with the official privacy policy
        before launching the product.
      </p>
    </div>
  </Layout>
);

export default PrivacyPage; 