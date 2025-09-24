
"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const foregroundColors = [
  { name: 'Slate', value: '224 71.4% 4.1%' },
  { name: 'Azure', value: '205 90% 45%' },
  { name: 'Crimson', value: '347 77% 50%' },
  { name: 'Emerald', value: '145 63% 40%' },
  { name: 'Amber', value: '38 92% 50%' },
];

const backgroundColors = [
  { name: 'White', value: '0 0% 100%' },
  { name: 'Linen', value: '30 56% 95%' },
  { name: 'Mint', value: '160 60% 95%' },
  { name: 'Lavender', value: '250 60% 97%' },
  { name: 'Charcoal', value: '222.2 84% 4.9%' },
];


export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [isCustomizing, setIsCustomizing] = React.useState(false);

  const applyCustomColors = (fg: string, bg: string) => {
    document.documentElement.style.setProperty('--foreground', fg);
    document.documentElement.style.setProperty('--background', bg);
    localStorage.setItem('custom-foreground', fg);
    localStorage.setItem('custom-background', bg);
    setTheme('light'); // Use light mode as a base for custom styles
  }
  
  React.useEffect(() => {
    const customFg = localStorage.getItem('custom-foreground');
    const customBg = localStorage.getItem('custom-background');
    if (customFg && customBg) {
      applyCustomColors(customFg, customBg);
    }
  }, []);

  return (
    <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {
            setTheme("light");
            localStorage.removeItem('custom-foreground');
            localStorage.removeItem('custom-background');
            window.location.reload();
          }}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setTheme("dark");
            localStorage.removeItem('custom-foreground');
            localStorage.removeItem('custom-background');
            window.location.reload();
          }}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem onSelect={() => setIsCustomizing(true)}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Customise</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customise Theme</DialogTitle>
          <DialogDescription>
            Pick a foreground and background color for your custom theme.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
            <div>
                <h4 className="mb-2 font-medium">Foreground Color</h4>
                <div className="flex flex-wrap gap-2">
                    {foregroundColors.map(color => (
                        <Button key={color.name} variant="outline" onClick={() => applyCustomColors(color.value, localStorage.getItem('custom-background') || backgroundColors[0].value)}>
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: `hsl(${color.value})` }}></div>
                            {color.name}
                        </Button>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="mb-2 font-medium">Background Color</h4>
                <div className="flex flex-wrap gap-2">
                    {backgroundColors.map(color => (
                        <Button key={color.name} variant="outline" onClick={() => applyCustomColors(localStorage.getItem('custom-foreground') || foregroundColors[0].value, color.value)}>
                            <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: `hsl(${color.value})` }}></div>
                            {color.name}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
