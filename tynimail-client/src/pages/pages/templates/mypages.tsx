import { useState } from "react";
import TempalateWrapper from "./wrapper";
import { Link } from "react-router";
import { FaPlus } from "react-icons/fa6";
import { usePages } from "@/hooks/use-pages";

const PageTemplatesMyPages = () => {
  const [search, setSearch] = useState("");
  const { GET_ALL_PAGES } = usePages();

  const { data, isLoading, isError, error } = GET_ALL_PAGES();

  const pageData = data?.pages ?? [];

  return (
    <TempalateWrapper setSearch={setSearch} search={search}>
      <ul className="grid  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <li className="">
          <Link to="/page-builder">
            <div className="bg-card relative h-70 lg:h-[455px] w-full rounded-2xl overflow-hidden ">
              <img
                src="/pattern.png"
                alt="pattern"
                className="dark:hidden block absolute inset-0 h-full w-full object-cover"
              />
              <img
                src="/pattern-2.png"
                alt="pattern"
                className="dark:block hidden  absolute inset-0 h-full w-full object-cover"
              />

              <div className="h-full py-12 relative z-10 flex justify-center items-center flex-col">
                <div className="border-2 border-primary rounded-[10px] w-10 h-10 flex justify-center items-center">
                  <FaPlus className="text-base leading-none fill-primary " />
                </div>
                <h2 className="text-primary text-base lg:text-xl text-center leading-[30px] font-medium mt-3">
                  Start From Scratch
                </h2>
              </div>
            </div>
          </Link>
        </li>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white rounded-2xl h-70 lg:h-[455px] w-full p-2.5"
            >
              <div className="bg-gray-200 h-full w-full rounded-xl"></div>
            </div>
          ))
        ) : isError ? (
          <li className="h-70 lg:h-[455px] p-2.5 rounded-2xl bg-card cursor-pointer   overflow-hidden ">
            <div className=" h-full w-full overflow-hidden">
              <div className="flex justify-center items-center h-full">
                <h2 className="text-red-500 font-medium text-2xl">Not Found</h2>
                <p>{error?.message}</p>
              </div>
            </div>
          </li>
        ) : pageData.length > 0 ? (
          pageData.map((page: any, index: number) => {
            const html = JSON.parse(page.content).html;
            return (
              <li
                key={index}
                className="h-70 lg:h-[455px] p-2.5 rounded-2xl bg-card cursor-pointer   overflow-hidden "
              >
                <Link className="" to={`/page-update/${page.id}`}>
                  <div className=" h-full w-full overflow-hidden">
                    <h2>Page</h2>
                    <div
                      className=""
                      dangerouslySetInnerHTML={{ __html: html }}
                    ></div>
                  </div>
                </Link>
              </li>
            );
          })
        ) : (
          <li className="h-70 lg:h-[455px] p-2.5 rounded-2xl bg-card cursor-pointer   overflow-hidden ">
            <Link className="" to={`/page-builder/1`}>
              <div className=" h-full w-full overflow-hidden">
                <div className="">
                  <h2>Not Found</h2>
                </div>
              </div>
            </Link>
          </li>
        )}
      </ul>
    </TempalateWrapper>
  );
};

export default PageTemplatesMyPages;
