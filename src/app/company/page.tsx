"use client";

const CompanyPage = () => {
  return (
      <div className="py-12 max-w-4xl mx-auto text-gray-700">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        <p className="mb-4">
          At <strong>esü</strong>, we believe in the power of high-quality
          products that enhance everyday life. We carefully curate every item we
          sell to ensure it meets our rigorous standards of excellence.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="mb-4">
          Our mission is to provide customers with products that combine style,
          quality, and functionality. We focus on sourcing ethically produced
          goods from around the world.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <ul className="list-disc ml-6">
          <li className="mb-2">Commitment to quality</li>
          <li className="mb-2">Customer satisfaction</li>
          <li className="mb-2">Environmental responsibility</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
        <p>
          We’re always looking for talented individuals to join our growing
          team. Visit our careers page to learn about current opportunities.
        </p>
      </div>
  );
};

export default CompanyPage;
