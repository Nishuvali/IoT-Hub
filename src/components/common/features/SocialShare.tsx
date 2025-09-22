import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '../../ui/forms/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/forms/textarea';
import { Badge } from '../../ui/feedback/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/overlay/dialog';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
}

interface SocialShareProps {
  product: Product;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ product, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const productUrl = `${window.location.origin}/product/${product.id}`;
  const shareText = `Check out this amazing ${product.name} from IoT Hub! ${productUrl}`;
  const shareTextWithMessage = customMessage || shareText;

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareTextWithMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Shared to Facebook!');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithMessage)}&url=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Shared to Twitter!');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}&summary=${encodeURIComponent(shareTextWithMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Shared to LinkedIn!');
  };

  const shareViaEmail = () => {
    const subject = `Check out this ${product.name} from IoT Hub`;
    const body = `Hi!\n\nI found this amazing product and thought you might be interested:\n\n${product.name}\n${product.description}\n\nPrice: ₹${product.price}\n\nView it here: ${productUrl}\n\nBest regards!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
    toast.success('Email client opened!');
  };

  const shareViaWhatsApp = () => {
    const message = `Check out this amazing ${product.name} from IoT Hub!\n\n${product.description}\n\nPrice: ₹${product.price}\n\nView it here: ${productUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('Shared to WhatsApp!');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareTextWithMessage);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareToSocialMedia = (platform: string) => {
    // Track social sharing analytics
    trackSocialShare(platform);
  };

  const trackSocialShare = (platform: string) => {
    const shareData = {
      productId: product.id,
      platform,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Store in localStorage for analytics (in production, send to analytics service)
    const shares = JSON.parse(localStorage.getItem('social_shares') || '[]');
    shares.push(shareData);
    localStorage.setItem('social_shares', JSON.stringify(shares.slice(-100))); // Keep last 100 shares
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`px-2 ${className}`}>
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    <span className="text-sm font-bold text-primary">₹{product.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div>
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add a personal message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Share Options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  shareToFacebook();
                  shareToSocialMedia('facebook');
                }}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  shareToTwitter();
                  shareToSocialMedia('twitter');
                }}
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  shareToLinkedIn();
                  shareToSocialMedia('linkedin');
                }}
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  shareViaWhatsApp();
                  shareToSocialMedia('whatsapp');
                }}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Email and Copy Link */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                shareViaEmail();
                shareToSocialMedia('email');
              }}
              className="w-full flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Share via Email
            </Button>

            <div className="flex gap-2">
              <Input
                value={shareTextWithMessage}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Product URL */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Product URL</Label>
            <div className="flex gap-2">
              <Input
                value={productUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(productUrl);
                  toast.success('Product URL copied!');
                }}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
