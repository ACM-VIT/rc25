export function pythonFunction(code: string, testcases: number, delimiter: string): string {
    const template = `
# Original function code here

if __name__ == "__main__":
    for _ in range(${testcases}):
        solve();
        print("${delimiter}", end="")`;

    return template.replace('# Original function code here', code);
}

export function cFunction(code: string, testcases: number, delimiter: string): string {
    const template = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdbool.h>
#include <limits.h>
#include <ctype.h>

// Original function code here

int main() {
    int t = ${testcases};
    while(t--) {
        solve();
        printf("${delimiter}");
    }
    return 0;
}`;

    return template.replace('// Original function code here', code);
}

export function cppFunction(code: string, testcases: number, delimiter: string): string {
    const template = `#include <bits/stdc++.h>
using namespace std;

// Original function code here

int main() {
    int t = ${testcases};
    while(t--) {
        solve();
        cout << "${delimiter}";
    }
    return 0;
}`;

    return template.replace('// Original function code here', code);
}

export function javaFunction(code: string, testcases: number, delimiter: string): string {
    const template = `import java.util.*;

// Original function code here


public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int t = ${testcases};
        while(t-- > 0) {
            solution.solve();
            System.out.print("${delimiter}");
        }
    }
}`;

    return template.replace('// Original function code here', code);
}
export function jsFunction(code: string, testcases: number, delimiter: string): string {
    const template = `// Original function code here

for(let i = 0; i < ${testcases}; i++) {
    solve();
    process.stdout.write("${delimiter}");
}`;

    return template.replace('// Original function code here', code);
}

export function goFunction(code: string, testcases: number, delimiter: string): string {
    const template = `package main

import (
    "fmt"
)

// Original function code here

func main() {
    for i := 0; i < ${testcases}; i++ {
        solve()
        fmt.Print("${delimiter}")
    }
}`;

    return template.replace('// Original function code here', code);
}

export function rustFunction(code: string, testcases: number, delimiter: string): string {
    const template = `use std::io::{self, Write};
use std::collections::*;

// Original function code here

fn main() {
    for _ in 0..${testcases} {
        solve();
        print!("${delimiter}");
        io::stdout().flush().unwrap();
    }
}`;

    return template.replace('// Original function code here', code);
}