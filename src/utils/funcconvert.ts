export function pythonFunction(code: string): string {
  const template = `
# Original function code here

if __name__ == "__main__":
    solve()`;

  return template.replace("# Original function code here", code);
}

export function cFunction(code: string): string {
  const template = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdbool.h>
#include <limits.h>
#include <ctype.h>

// Original function code here

int main() {
    solve();
    return 0;
}`;

  return template.replace("// Original function code here", code);
}

export function cppFunction(code: string): string {
  const template = `#include <bits/stdc++.h>
using namespace std;

// Original function code here

int main() {
    solve();
    return 0;
}`;

  return template.replace("// Original function code here", code);
}

export function javaFunction(code: string): string {
  const template = `import java.util.*;

// Original function code here


public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        solution.solve();
    }
}`;

  return template.replace("// Original function code here", code);
}
export function jsFunction(code: string): string {
  const template = `// Original function code here

solve();`;

  return template.replace("// Original function code here", code);
}

export function goFunction(code: string): string {
  const template = `package main

// Original function code here

func main() {
    solve()
}`;

  return template.replace("// Original function code here", code);
}

export function rustFunction(code: string): string {
  const template = `use std::io::{self, Write};
use std::collections::*;

// Original function code here

fn main() {
    solve();
    io::stdout().flush().unwrap();
}`;

  return template.replace("// Original function code here", code);
}
