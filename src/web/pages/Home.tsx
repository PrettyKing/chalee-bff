import { useEffect, useState } from 'react';

export default function Home() {
  const [persons, setPersons] = useState([]);
  const fetchData = async () => {
    const data = (await fetch('/dev/list')).json();
    const { data: persons } = await data;
    console.log('🍊🍊🍊🍊🍊🍊🍊 ', persons);
    setPersons(persons);
  };
  const setData = async () => {
    await fetch('/dev/setData');
    await fetchData();
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center mt-5">
      <h1 className="text-4xl font-bold mb-4">欢迎来到我们的 BFF JENKINS TEST</h1>
      <p className="text-lg text-gray-700">这是一个简单的去中心化应用示例。</p>
      <button
        onClick={setData}
        className="w-[150px] border rounded-4xl border-amber-950 border-l-gray-500 caret-amber-400 bg-amber-500"
      >
        setData
      </button>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold mb-2">Person List</h2>
        <ul className="list-disc pl-5">
          {persons.map((person: any, index: number) => (
            <li key={index} className="mb-1">
              {person.username} - {person.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
