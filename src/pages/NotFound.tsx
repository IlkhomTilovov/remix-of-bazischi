import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useSEO from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  // Google va boshqa qidiruv tizimlariga: bu sahifa indekslanmasin
  useSEO({
    title: "Sahifa topilmadi — 404",
    description: "Kechirasiz, siz qidirgan sahifa mavjud emas.",
    noindex: true,
    nofollow: true,
  });

  useEffect(() => {
    console.warn("404: Mavjud bo'lmagan sahifa:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <h1 className="mb-3 text-7xl font-bold text-primary">404</h1>
        <p className="mb-2 text-2xl font-semibold">Sahifa topilmadi</p>
        <p className="mb-8 text-muted-foreground">
          Kechirasiz, siz qidirgan sahifa mavjud emas yoki ko'chirilgan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Bosh sahifa
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/catalog">
              <Search className="mr-2 h-4 w-4" />
              Katalogga o'tish
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
