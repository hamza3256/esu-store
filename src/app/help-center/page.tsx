"use client";

const HelpCenterPage = () => {
  return (
      <div className="py-12 max-w-4xl mx-auto text-gray-700">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Help Center</h1>
        <p className="mb-4">
          We’re here to help you with any questions you may have. Browse our
          frequently asked questions or contact our support team.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <ul className="list-disc ml-6">
          <li className="mb-2">How do I track my order?</li>
          <li className="mb-2">How can I return a product?</li>
          <li className="mb-2">What are the delivery times?</li>
          <li className="mb-2">How do I become a seller?</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>
          If you have any further questions, please reach out to us at
          support@esustore.com, and we’ll be happy to assist you.
        </p>
      </div>
  );
};

export default HelpCenterPage;
