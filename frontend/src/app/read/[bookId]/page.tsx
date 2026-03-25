import { PagePlaceholder } from "../../page";

type ReaderPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { bookId } = await params;

  return (
    <PagePlaceholder
      title="Reading Book"
      subtitle={`A simple placeholder reader view for book ${bookId}.`}
    />
  );
}
