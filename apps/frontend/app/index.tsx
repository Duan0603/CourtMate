import { YStack, Text, Button, H1, Paragraph } from 'tamagui';

export default function Home() {
  return (
    <YStack f={1} ai="center" jc="center" bg="$background" p="$6" gap="$4">
      <H1 fos="$9" fow="bold" ta="center">CourtMate</H1>
      <Paragraph fos="$5" ta="center" col="$colorMuted">
        Nền tảng tổng hợp và cá nhân hóa thông tin thể thao phong trào.
      </Paragraph>
      <Button 
        theme="active" 
        size="$5" 
        br="$4"
        mt="$6"
      >
        Khám phá ngay
      </Button>
    </YStack>
  );
}
