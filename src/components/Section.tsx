interface SectionProps {
    children: React.ReactNode;
    backgroundColor?: string;
  }
  
  export const Section = ({ children, backgroundColor = "bg-white" }: SectionProps) => {
    return <section className={`${backgroundColor} py-24`}>{children}</section>;
  };
  