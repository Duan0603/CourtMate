import React, { useState } from 'react';
import { Sheet, YStack, XStack, Button, H3, Paragraph, RadioGroup, Label, TextArea, Spinner } from 'tamagui';
import { Alert } from 'react-native';

const REPORT_REASONS = [
  { id: 'fake', label: 'Thông tin giả mạo/lừa đảo' },
  { id: 'spam', label: 'Spam/Quảng cáo' },
  { id: 'duplicate', label: 'Trùng lặp' },
  { id: 'other', label: 'Lý do khác' },
];

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: 'TOURNAMENT' | 'FEED_ITEM';
}

export const ReportModal: React.FC<ReportModalProps> = ({ open, onOpenChange, targetId, targetType }) => {
  const [reason, setReason] = useState(REPORT_REASONS[0].id);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          reason,
          notes: reason === 'other' ? notes : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi báo cáo');
      }

      Alert.alert('Thành công', 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét thông tin này.');
      onOpenChange(false);
      // Reset form
      setReason(REPORT_REASONS[0].id);
      setNotes('');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[60]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" space="$4" bg="$background">
        <H3 col="$color">Báo cáo vi phạm</H3>
        <Paragraph col="$colorMuted">
          Vui lòng cho chúng tôi biết vấn đề với nội dung này.
        </Paragraph>

        <RadioGroup value={reason} onValueChange={setReason} space="$2" mt="$2">
          {REPORT_REASONS.map((item) => (
            <XStack key={item.id} ai="center" space="$3">
              <RadioGroup.Item value={item.id} id={item.id}>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
              <Label htmlFor={item.id} col="$color">{item.label}</Label>
            </XStack>
          ))}
        </RadioGroup>

        {reason === 'other' && (
          <TextArea
            value={notes}
            onChangeText={setNotes}
            placeholder="Mô tả chi tiết vấn đề..."
            mt="$2"
            minHeight={80}
            bg="$backgroundHover"
            col="$color"
            borderColor="$borderColor"
          />
        )}

        <XStack mt="$4" space="$3" jc="flex-end">
          <Button theme="alt2" onPress={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button bg="$red9Light" col="white" onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Spinner color="white" /> : 'Gửi báo cáo'}
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
};
