import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IoStar } from "react-icons/io5";

const SliderForSignUp = () => {
  const testimonials = [
    {
      quote:
        "From design to delivery, everything you need to create effective email campaigns streamlined in one place.",
      name: "Lulu Mayers",
      role: "CEO",
      company: "Hourglass",
      industry: "Digital Marketing Agency",
      stars: 5,
    },
    {
      quote:
        "TYNIMAIL transformed our email marketing strategy; open rates and engagement have never been higher.",
      name: "James Carter",
      role: "Marketing Director",
      company: "BlueSky Tech",
      industry: "Software Solutions",
      stars: 5,
    },
    {
      quote:
        "A seamless experience from signup to sending campaigns. Absolutely love the intuitive dashboard!",
      name: "Sophia Lopez",
      role: "Product Manager",
      company: "Innovate Labs",
      industry: "Tech Startup",
      stars: 4,
    },
    {
      quote:
        "The analytics and reporting features are unmatched. We can make smarter marketing decisions faster.",
      name: "Ethan Brown",
      role: "Head of Marketing",
      company: "BrightWave",
      industry: "E-commerce",
      stars: 5,
    },
    {
      quote:
        "Customer support is amazing! Quick responses and always helpful. Highly recommend.",
      name: "Olivia Johnson",
      role: "Operations Lead",
      company: "EcoWorld",
      industry: "Sustainable Products",
      stars: 5,
    },
    {
      quote:
        "We cut down our campaign creation time by half. The platform is intuitive and powerful.",
      name: "Liam Smith",
      role: "CMO",
      company: "NextGen Media",
      industry: "Advertising",
      stars: 4,
    },
    {
      quote:
        "Perfect for small businesses looking to scale email marketing without the headache of complex software.",
      name: "Emma Davis",
      role: "Founder",
      company: "Crafty Co.",
      industry: "Artisan Goods",
      stars: 4,
    },
    {
      quote:
        "The drag-and-drop editor is smooth and responsive. Designing emails is actually fun now!",
      name: "Noah Wilson",
      role: "Creative Director",
      company: "PixelHive",
      industry: "Design Agency",
      stars: 5,
    },
    {
      quote:
        "Integration with our CRM was seamless, and we can now segment our audience like never before.",
      name: "Ava Martinez",
      role: "Marketing Specialist",
      company: "GreenLeaf",
      industry: "Health & Wellness",
      stars: 5,
    },
    {
      quote:
        "I love the automated campaign workflows. It saves so much time and ensures nothing is missed.",
      name: "Lucas Thompson",
      role: "Email Marketing Manager",
      company: "TechHive",
      industry: "SaaS",
      stars: 5,
    },
  ];

  return (
    <div className="backdrop-blur-[90px] bg-white/15 p-8   absolute top-auto left-0 right-0 bottom-0 m-6 rounded-b-xl  ">
      <Carousel>
        <CarouselContent>
          {testimonials.map((item, index) => (
            <CarouselItem key={index}>
              <div>
                <h2 className="font-medium text-white text-xl lg:text-3xl lg:leading-[120%] capitalize">
                  {item.quote}
                </h2>
                <div className="flex justify-between items-start mt-13 mb-3">
                  <h2 className="font-semibold text-xl lg:text-2xl text-white font-inter">
                    {item.name}
                  </h2>
                  <ul className="flex gap-0.5 justify-end">
                    {Array.from({ length: 5 }).map((_, yindex) => (
                      <li className="" key={yindex}>
                        <IoStar size={20} className="text-star" />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1">
                  <div>
                    <h2 className="font-inter text-base  font-normal mb-1 text-white line-clamp-1">
                      {item.role}, {item.company}
                    </h2>
                    <p className="font-inter text-base  font-normal text-white">
                      {item.industry}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="">
          <CarouselPrevious
            size="icon-lg"
            iconClassName="size-7 "
            className="bottom-0 top-auto h-10 w-10 lg:h-14 lg:w-14 text-3xl left-[calc(100%-100px)] lg:left-[calc(100%-140px)] bg-transparent border border-white hover:bg-transparent text-white hover:text-white"
          />
          <CarouselNext
            size="icon-lg"
            iconClassName="size-7"
            className="right-0  top-auto h-10 w-10 lg:h-14 lg:w-14 text-3xl bottom-0  bg-transparent border border-white hover:bg-transparent text-white hover:text-white"
          />
        </div>
      </Carousel>
    </div>
  );
};

export default SliderForSignUp;
