import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "@/components/layout/navbar.css";
import "@/components/layout/footer.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
