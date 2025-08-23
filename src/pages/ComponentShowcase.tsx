import React, { useState } from 'react'
import {
  Button,
  Input,
  Label,
  Checkbox,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/ui'

export default function ComponentShowcase() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false,
    category: '',
  })

  const [alerts, setAlerts] = useState<Array<{id: string, type: 'default' | 'destructive', title: string, message: string}>>([])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = Date.now().toString()
    setAlerts(prev => [...prev, {
      id,
      type: 'default',
      title: 'Form Submitted',
      message: `Thank you, ${formData.name}! Your message has been received.`
    }])
    
    // Clear alerts after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 5000)
  }

  const showErrorAlert = () => {
    const id = Date.now().toString()
    setAlerts(prev => [...prev, {
      id,
      type: 'destructive',
      title: 'Error',
      message: 'This is a sample error message for testing purposes.'
    }])
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 5000)
  }

  return (
    <main className="min-h-screen bg-background p-8" role="main">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground" data-testid="page-title">
            UI Components Showcase
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive testing environment for all UI components
          </p>
        </div>

        {/* Alerts Section */}
        <div className="space-y-4" data-testid="alerts-section">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type} data-testid={`alert-${alert.id}`}>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Buttons Section */}
        <Card data-testid="buttons-card">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button data-testid="btn-primary" variant="default" type="button">
                Primary Button
              </Button>
              <Button data-testid="btn-secondary" variant="secondary" type="button">
                Secondary Button
              </Button>
              <Button data-testid="btn-outline" variant="outline" type="button">
                Outline Button
              </Button>
              <Button data-testid="btn-destructive" variant="destructive" type="button" onClick={showErrorAlert}>
                Show Error Alert
              </Button>
              <Button data-testid="btn-ghost" variant="ghost" type="button">
                Ghost Button
              </Button>
              <Button data-testid="btn-link" variant="link" type="button">
                Link Button
              </Button>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button data-testid="btn-disabled" disabled type="button">
                Disabled Button
              </Button>
              <Button data-testid="btn-loading" disabled type="button">
                Loading...
              </Button>
              <Button data-testid="btn-small" size="sm" type="button">
                Small Button
              </Button>
              <Button data-testid="btn-large" size="lg" type="button">
                Large Button
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Section */}
        <Card data-testid="form-card">
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Interactive form with validation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6" data-testid="contact-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general" data-testid="option-general">General Inquiry</SelectItem>
                    <SelectItem value="support" data-testid="option-support">Support</SelectItem>
                    <SelectItem value="sales" data-testid="option-sales">Sales</SelectItem>
                    <SelectItem value="feedback" data-testid="option-feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  data-testid="textarea-message"
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribe"
                  data-testid="checkbox-subscribe"
                  checked={formData.subscribe}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribe: !!checked }))}
                />
                <Label htmlFor="subscribe">Subscribe to our newsletter</Label>
              </div>

              <Button 
                type="submit" 
                data-testid="btn-submit"
                className="w-full md:w-auto"
                disabled={!formData.name || !formData.email || !formData.message}
                aria-describedby="form-validation-info"
              >
                Submit Form
              </Button>
              <div id="form-validation-info" className="sr-only">
                All required fields must be filled to submit the form
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card data-testid="badges-card">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge data-testid="badge-default" variant="default">Default</Badge>
              <Badge data-testid="badge-secondary" variant="secondary">Secondary</Badge>
              <Badge data-testid="badge-destructive" variant="destructive">Error</Badge>
              <Badge data-testid="badge-outline" variant="outline">Outline</Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge data-testid="badge-count" variant="destructive">99+</Badge>
              <Badge data-testid="badge-status" variant="default">Active</Badge>
              <Badge data-testid="badge-role" variant="secondary">Admin</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="cards-grid">
          <Card data-testid="pricing-card-basic" className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Basic Plan</CardTitle>
              <CardDescription>Perfect for individuals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$9.99</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </CardContent>
            <CardFooter>
              <Button data-testid="btn-select-basic" className="w-full" type="button">Select Plan</Button>
            </CardFooter>
          </Card>

          <Card data-testid="pricing-card-pro" className="hover:shadow-lg transition-shadow border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro Plan</CardTitle>
                <Badge data-testid="badge-popular">Popular</Badge>
              </div>
              <CardDescription>Great for growing teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$19.99</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </CardContent>
            <CardFooter>
              <Button data-testid="btn-select-pro" className="w-full" type="button">Select Plan</Button>
            </CardFooter>
          </Card>

          <Card data-testid="pricing-card-enterprise" className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Contact Us</div>
              <div className="text-sm text-muted-foreground">Custom pricing</div>
            </CardContent>
            <CardFooter>
              <Button data-testid="btn-contact-enterprise" variant="outline" className="w-full" type="button">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Interactive Demo Section */}
        <Card data-testid="interactive-demo-card">
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>Try different component states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Component States</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Input States</Label>
                  <div className="space-y-2">
                    <Input placeholder="Normal input" data-testid="input-normal" />
                    <Input placeholder="Disabled input" disabled data-testid="input-disabled" />
                    <Input placeholder="Error input" className="border-red-500" data-testid="input-error" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Button States</Label>
                  <div className="space-y-2">
                    <Button data-testid="btn-hover-test" className="w-full" type="button">Hover Me</Button>
                    <Button data-testid="btn-focus-test" className="w-full" type="button">Focus Test</Button>
                    <Button data-testid="btn-active-test" className="w-full" type="button">Active Test</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            This showcase is designed for comprehensive E2E testing of all UI components.
          </p>
        </div>
      </div>
    </main>
  )
}
