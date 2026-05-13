import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";

const SearchAble = ({
  searchQuery,
  setSearchQuery,
  placeholder,
  hanldeFiler,
  filterHide = true,
}: {
  filterHide?: boolean;
  searchQuery: string;
  placeholder: string;
  hanldeFiler?: any;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="max-w-81 w-full relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="pl-10"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {hanldeFiler && (
          <Button variant="outline" onClick={hanldeFiler}>
            <Filter size={18} />
            <span className="text-sm font-medium">Filter</span>
          </Button>
        )}

        {filterHide && (
          <Button variant="outline">
            <Filter size={18} />
            <span className="text-sm font-medium">Filter</span>
          </Button>
        )}
      </div>
    </>
  );
};

export default SearchAble;
