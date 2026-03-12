"use client";

import { createAuditor } from 'audit-core';
import { useEffect } from 'react';

export function AccessibilityAudit() {
    useEffect(() => {
      const auditor = createAuditor()

      // wait for the page to fully render
      const timeout = setTimeout(async () => {
        const result = await auditor.run(document)

        if (result.violations.length > 0) {
          console.groupCollapsed(
            `[audit-core] ${result.violations.length} violation(s) found`
          )
          for (const v of result.violations) {
            console.warn(`${v.impact.toUpperCase()}: ${v.title}`)
            for (const node of v.nodes) {
              console.log(`  ${node.selector} — ${node.reason}`)
            }
          }
          console.groupEnd()
        }

        if (result.incomplete.length > 0) {
          console.info(
            `[audit-core] ${result.incomplete.length} rule(s) need manual review`
          )
        }
      }, 1000)

      return () => clearTimeout(timeout)
    }, [])

    return null
  }