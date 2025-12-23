import { useEffect, useMemo, useRef, useState } from "react";

// Components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

// Tanstack
import { useInfiniteQuery } from "@tanstack/react-query";

// API
import { getResidents, type GetResidentsResponse } from "@/api/get-residents";


type SelectResidentProps = {
  value?: string;
  onChange?: (residentId: string) => void;
  inputId?: string;
  placeholder?: string;
  selectedLabel?: string;
};

export function SelectResident({
  value,
  onChange,
  inputId = "resident",
  placeholder = "Buscar moradores",
  selectedLabel,
}: SelectResidentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const previousValueRef = useRef<string | undefined>(undefined);
  const manualClearRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedSearch = searchTerm.trim();
  const [debouncedSearch, setDebouncedSearch] = useState(normalizedSearch);
  const PAGE_SIZE = 3;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
    }, 300);

    return () => clearTimeout(timeout);
  }, [normalizedSearch]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GetResidentsResponse>({
    queryKey: ["residents", { search: debouncedSearch }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const currentPage =
        typeof pageParam === "number" && !Number.isNaN(pageParam)
          ? pageParam
          : 1;

      return getResidents({
        limit: PAGE_SIZE,
        page: currentPage,
        search: debouncedSearch || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const residents = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const showEmptyState = !isLoading && !isError && residents.length === 0;

  useEffect(() => {
    if (!value) {
      if (!manualClearRef.current && previousValueRef.current) {
        setSearchTerm("");
      }
      manualClearRef.current = false;
      previousValueRef.current = value;
      return;
    }

    const match = residents.find((resident) => resident.id === value);
    if (match) {
      setSearchTerm(match.name);
    } else if (selectedLabel && previousValueRef.current !== value) {
      setSearchTerm(selectedLabel);
    }

    manualClearRef.current = false;
    previousValueRef.current = value;
  }, [residents, selectedLabel, value]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleInputValueChange = (inputValue: string) => {
    setSearchTerm(inputValue);
    if (!isOpen) {
      setIsOpen(true);
    }

    if (value) {
      manualClearRef.current = true;
      onChange?.("");
    }
  };

  const handleInputFocus = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleSelectResident = (residentId: string, residentName: string) => {
    onChange?.(residentId);
    setSearchTerm(residentName);
    setIsOpen(false);
  };

  return (
    <Command>
      <CommandInput
        id={inputId}
        placeholder={placeholder}
        value={searchTerm}
        onValueChange={handleInputValueChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {isOpen && (
        <CommandList
          onMouseDown={(event) => {
            // Avoid closing the list when interacting with options
            event.preventDefault();
          }}
        >
          {isLoading && <CommandEmpty>Carregando moradores...</CommandEmpty>}

          {isError && (
            <CommandEmpty>
              Não foi possível carregar os moradores. Tente novamente.
            </CommandEmpty>
          )}

          {showEmptyState && (
            <CommandEmpty>Nenhum morador encontrado.</CommandEmpty>
          )}

          {residents.length > 0 && (
            <CommandGroup heading="Moradores">
              {residents.map((resident) => {
                const apartment = resident.apartment ?? "Sem residência";
                const phone = resident.phone ?? "Sem telefone";

                return (
                  <CommandItem
                    key={resident.id}
                    value={`${resident.name} ${apartment} ${phone ?? ""}`}
                    onSelect={() =>
                      handleSelectResident(resident.id, resident.name)
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{resident.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {apartment} • {phone}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}

              {hasNextPage && (
                <button
                  type="button"
                  className="mt-1 w-full rounded-sm px-2 py-1.5 text-left text-sm font-medium text-primary transition hover:bg-accent disabled:opacity-60"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Carregando mais..." : "Carregar mais"}
                </button>
              )}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}
