import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  render,
} from "@react-email/components";

import * as React from "react";

interface EmailTemplateProps {
  actionLabel: string;
  buttonText: string;
  href: string;
}

export const EmailTemplate = ({
  actionLabel,
  buttonText,
  href,
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>The marketplace for high-quality products.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`https://esu.london/bear_email_body.png`}
              width="150"
              height="150"
              alt="ESÜ Store"
              style={logo}
            />
          </Section>
          <Section style={content}>
            <Text style={greeting}>Hello,</Text>
            <Text style={paragraph}>
              Thank you for choosing ESÜ Store, your premier destination for high-quality products. 
              We&apos;re excited to have you join our community. Please use the button below to {actionLabel}.
            </Text>
            <Section style={btnContainer}>
              <Button style={button} href={href}>
                {buttonText}
              </Button>
            </Section>
            <Section style={infoSection}>
              <Text style={infoTitle}>We&apos;re here to help</Text>
              <Text style={infoText}>
                Our dedicated support team is ready to assist you with any questions or concerns you may have. 
                We&apos;re committed to providing you with the best possible experience.
              </Text>
              <Text style={infoText}>
                Email: {`support@${process.env.DOMAIN_NAME}`}
                <br />
                Phone: +44 (0) 79 5529 0709
              </Text>
            </Section>
            <Section style={infoSection}>
              <Text style={infoTitle}>Join our community</Text>
              <Text style={infoText}>
                Stay updated with our latest collections, exclusive offers, and behind-the-scenes content:
                <br />
                • Instagram: @esu.gems.gallery
                <br />
                • Twitter: @esustoreofficial
                <br />
                • Facebook: /esustoreofficial
              </Text>
            </Section>
            <Text style={paragraph}>
              Warm regards,
              <br />
              <Text style={signature}>The ESÜ Store team</Text>
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              If you did not request this email, you can safely ignore it.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} ESÜ Store. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const PrimaryActionEmailHtml = (props: EmailTemplateProps) =>
  render(<EmailTemplate {...props} />, { pretty: true });

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const content = {
  padding: "0 20px",
};

const logo = {
  margin: "0 auto",
  marginBottom: "24px",
};

const greeting = {
  fontSize: "18px",
  lineHeight: "28px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
  marginBottom: "24px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  padding: "14px 24px",
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  transition: "background-color 0.2s ease",
};

const signature = {
  color: "#2563eb",
  fontWeight: "600",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "8px",
};

const infoSection = {
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "8px",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#374151",
  marginBottom: "8px",
};
