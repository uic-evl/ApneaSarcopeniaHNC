import tw from "tailwind-styled-components";

export default function ActivitySummary({ title, items }) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      {items.map((item, index) => {
        if (typeof item === "function") {
          return item({ index });
        }

        const { label, value } = item;

        return (
          <Item key={`${label}-${value}-${index}`}>
            {label}: {value}
          </Item>
        );
      })}
    </Wrapper>
  );
}

const Title = tw.h3`
  text-gray-600
  text-lg
`;

const Wrapper = tw.div`
  px-12
  min-w-72
`;

const Item = tw.div`
  text-gray-400
`;
