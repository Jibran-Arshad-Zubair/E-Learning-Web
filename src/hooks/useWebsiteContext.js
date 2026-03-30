// src/hooks/useWebsiteContext.js
'use client'

import { useCallback } from 'react';

export function useWebsiteContext() {
  const getWebsiteContext = useCallback(() => {
    try {
      // Get all headings with their hierarchy
      const headings = [...document.querySelectorAll("h1, h2, h3")].map(h => ({
        level: h.tagName,
        text: h.innerText.trim()
      }));
      
      // Get all feature sections and courses
      const features = [];
      const featureSections = document.querySelectorAll('[class*="feature"], [class*="course"], [class*="category"], [class*="section"]');
      featureSections.forEach(section => {
        const text = section.innerText.trim();
        if (text.length > 20 && text.length < 500) {
          features.push(text);
        }
      });
      
      // Get stats and numbers
      const stats = [];
      const statElements = document.querySelectorAll('[class*="stat"], [class*="number"], [class*="count"]');
      statElements.forEach(el => {
        const text = el.innerText.trim();
        if (text && text.length < 100) {
          stats.push(text);
        }
      });
      
      // Get main content
      const mainContent = document.querySelector('main')?.innerText.slice(0, 2000) || '';
      const heroText = document.querySelector('section:first-of-type')?.innerText.slice(0, 500) || '';
      
      // Get page title and meta description
      const title = document.title;
      const metaDescription = document.querySelector("meta[name='description']")?.content || "";
      
      // Get navigation links
      const navLinks = [...document.querySelectorAll('nav a, header a')]
        .slice(0, 10)
        .map(a => a.innerText.trim())
        .filter(t => t && t.length > 0 && t.length < 50);
      
      const context = {
        websiteName: "E-Learning Hub",
        title: title,
        description: metaDescription,
        url: window.location.href,
        pageType: getPageType(),
        headings: headings.slice(0, 10),
        features: features.slice(0, 8),
        stats: stats.slice(0, 5),
        mainContent: mainContent.slice(0, 1500),
        heroContent: heroText.slice(0, 500),
        navigation: navLinks,
      };
      
      return context;
      
    } catch (error) {
      console.error('Error extracting website context:', error);
      return {
        websiteName: "E-Learning Hub",
        title: document.title,
        url: window.location.href,
        error: 'Failed to extract full context'
      };
    }
  }, []);
  
  const getPageType = () => {
    const url = window.location.pathname;
    if (url === '/' || url === '') return 'homepage';
    if (url.includes('/courses')) return 'courses page';
    if (url.includes('/about')) return 'about page';
    if (url.includes('/contact')) return 'contact page';
    return 'website page';
  };
  
  const formatContextForAgent = useCallback((context) => {
    // Create a comprehensive, well-structured context for the agent
    let formatted = `=== WEBSITE INFORMATION ===
Website Name: ${context.websiteName}
Page Title: ${context.title}
Page Type: ${context.pageType}
URL: ${context.url}
Description: ${context.description}

=== WHAT THIS WEBSITE OFFERS ===
This is an online learning platform called "${context.websiteName}" where students can take courses in various subjects.

KEY FEATURES AND COURSES:
${context.features.slice(0, 5).map((f, i) => `${i+1}. ${f.substring(0, 200)}`).join('\n')}

KEY STATISTICS:
${context.stats.map(s => `- ${s}`).join('\n')}

MAIN SECTIONS OF THE WEBSITE:
${context.headings.filter(h => h.text).slice(0, 8).map(h => `- ${h.text}`).join('\n')}

WEBSITE CONTENT SUMMARY:
${context.heroContent.substring(0, 400)}

${context.mainContent.substring(0, 600)}

NAVIGATION MENU ITEMS:
${context.navigation.map(n => `- ${n}`).join('\n')}

=== INSTRUCTIONS FOR AI ASSISTANT ===
You are the AI assistant for ${context.websiteName}. When users ask about this website, you MUST answer based on the information above. Be enthusiastic and helpful. If asked about specific features, explain what's available. If asked about courses, mention the types of courses offered. Always speak as if you are representing this specific learning platform.

If you don't have specific information about something, say: "I don't have that specific information about ${context.websiteName}, but I can tell you about the features I know."
`;
    
    return formatted;
  }, []);
  
  return {
    getWebsiteContext,
    formatContextForAgent
  };
}