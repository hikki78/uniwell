"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import Link from "next/link";
import { navLinks } from "@/lib/constants";
import { scrollToHash } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const MotionNav = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 border-b bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <Link href="/" className="text-xl font-bold">UniWell</Link>
            </div>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base">
                    Product
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2 bg-card shadow-lg border border-purple-300/20 dark:border-purple-600/20">
                      {navLinks.map((link, i) => (
                        <div key={i}>
                          <Button
                            onClick={() => {
                              scrollToHash(link.href);
                            }}
                            className="w-full text-left bg-background hover:bg-purple-100 dark:hover:bg-purple-900/30 text-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:text-purple-700 dark:hover:text-purple-300 focus:bg-accent focus:text-accent-foreground"
                          >
                            {link.title}
                          </Button>
                        </div>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <ThemeSwitcher 
              alignHover="end"
              alignDropdown="end"
              size={"icon"}
              variant={"outline"}
            />
            <Link href="/sign-in">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign up</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
