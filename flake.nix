{
  inputs = {
    # Update lockfile with `nix flake lock --update-input <input>`
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    devenv,
    ...
  } @ inputs: let
    system = builtins.currentSystem;
    pkgs = nixpkgs.legacyPackages.${system};
    node = pkgs.nodejs_23;
  in {
    devShell.${system} = devenv.lib.mkShell {
      inherit inputs pkgs;
      modules = [
        {
          packages = [
            node
            pkgs.nodePackages.yarn
          ];

          scripts = {
            publish.exec = ''
              nix build .#dist --impure -L
              (cd result; npm publish --access public)
            '';
            snippets = {
              exec = ''
                const fs = require('fs');

                const [,, filename] = process.argv;

                const contents = fs.readFileSync(filename).toString();

                process.stdout.write(contents.replace(/\$embed: (.+)\$/g, (_, snippet) => {
                    return fs.readFileSync(snippet).toString().trim();
                }));
              '';
              package = node;
              binary = "node";
            };
          };

          pre-commit.hooks = {
            alejandra.enable = true;
            statix = {
              enable = true;
              pass_filenames = true;
              # https://github.com/oppiliappan/statix/issues/69
              entry = "bash -c 'echo \"$@\" | xargs -n1 ${pkgs.statix}/bin/statix check'";
            };
            biome = {
              package = pkgs.biome;
              enable = true;
              entry = "${pkgs.biome}/bin/biome check --write --no-errors-on-unmatched --diagnostic-level=error --verbose";
            };
            typos = {
              enable = true;
              entry = "${pkgs.typos}/bin/typos --force-exclude --exclude .git/*";
            };
          };
        }
      ];
    };

    dist = import ./nix/dist.nix pkgs;
  };
}
