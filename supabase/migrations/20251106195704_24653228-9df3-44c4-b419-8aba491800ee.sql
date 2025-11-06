-- Enable realtime for newsletter_send_status and ensure full row data
ALTER TABLE public.newsletter_send_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletter_send_status;