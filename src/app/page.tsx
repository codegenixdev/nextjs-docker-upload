import { Form } from "@/app/_components/form";
import { List } from "@/app/_components/list";

const Page = async () => {
  return (
    <div className="min-h-screen bg-[#1a1b26]">
      <div className="max-w-6xl mx-auto p-6">
        <Form />
        <List />
      </div>
    </div>
  );
};

export default Page;
