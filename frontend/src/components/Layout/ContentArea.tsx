export interface ContentAreaProps {
  children: React.ReactNode;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ children }) => {
  return (
    <main className="flex-1 bg-[#F5F7FA] p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
};

export default ContentArea;
