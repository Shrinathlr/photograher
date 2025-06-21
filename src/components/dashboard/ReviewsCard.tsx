
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ReviewsCard = () => {
  return (
    <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
      <CardHeader>
        <CardTitle>Client Reviews</CardTitle>
        <CardDescription>What your clients are saying.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground py-6 text-center">
          No reviews yet.
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewsCard;
