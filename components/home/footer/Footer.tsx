"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Footer() {
  const footerLinks = [
    { title: "Product", items: ["Features", "Roadmap", "Changelog"] },
    { title: "Resources", items: ["Guide", "Help Center", "Community"] },
    { title: "Company", items: ["About", "Blog", "Contact"] },
    { title: "Legal", items: ["Privacy", "Terms", "Security"] },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="border-t bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-between mt-12 pt-8 border-t"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">UniWell</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UniWell. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}