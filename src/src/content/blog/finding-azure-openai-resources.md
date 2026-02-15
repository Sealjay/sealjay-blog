---
title: "Finding deployed Azure OpenAI resources"
description: "Finding deployed Azure OpenAI resources in your tenant"
pubDateTime: "2023-06-19T11:44:00.000Z"
tags: ["Snippets", "AI", "Azure", "OpenAI", "Governance"]
---

> Note: I recently moved from a Ghost application, to an Astro built application. I used to filter out Code Snippets to fix out problems I'd experienced from the main blog feed - I still intend to do this, but at present, they're mixed in. I'll fix this soon.

Many organisations want to monitor or identify deployed [Azure OpenAI](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/overview?WT.mc_id=AI-MVP-5004204) services in your tenant.

This snippet is a command that you can [run in your terminal using the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/what-is-azure-cli?WT.mc_id=AI-MVP-5004204) to find deployed OpenAI resources.

### Code Snippet

```bash
az resource list --resource-type Microsoft.CognitiveServices/accounts --output tsv --query "[?kind=='OpenAI'].{Name:name, Kind:kind, CreatedBy:systemData.createdBy, CreatedAt:systemData.createdAt, Id: id}" > openai.tsv
```

### Example of output
In an `openai.tsv` file, you'll see output like this:
```tsv
<resource group name> <resource type> <email, like name@domain.tld> <date of creation> and <full ID for the resource>
```