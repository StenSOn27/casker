#!/usr/bin/env node
import 'reflect-metadata';
import { execute } from '@oclif/core';

await execute({ dir: import.meta.url });
