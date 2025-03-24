export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto text-gray-700">
      <header>
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="mb-4">
          Your privacy is important to us. This privacy statement explains the
          personal data we collect from you and how we use it.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect data to operate effectively and provide you with the best
          experience with our services. The types of information we collect
          include but are not limited to:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Personal identification information (e.g., name, email address).</li>
          <li>Usage data (e.g., pages visited, time spent on the site).</li>
          <li>Device information (e.g., browser type, IP address).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use the data we collect to operate our business and provide the
          products and services you use. Specifically, we use data to:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Improve our website and user experience.</li>
          <li>Respond to customer service requests.</li>
          <li>Send updates, promotions, and relevant communications.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Privacy Rights</h2>
        <p className="mb-4">
          You have the right to access, update, or delete your personal
          information. To exercise these rights or if you have any questions,
          please contact us at:
        </p>
        <a
          href="mailto:info@esu.london"
          className="text-blue-600 hover:underline"
        >
          info@esu.london
        </a>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. If we make significant
          changes, we will notify you by email or through a notice on our site.
        </p>
      </section>

      <footer className="mt-8 text-sm text-gray-500">
        <p>
          Last updated: {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </footer>
    </div>
  );
}
