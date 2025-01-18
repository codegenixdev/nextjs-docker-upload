import { Form } from "@/app/_components/form";
import { List } from "@/app/_components/list";

const Page = async () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">File Manager</h1>
      <Form />
      <List />
    </div>
  );
};

export default Page;
