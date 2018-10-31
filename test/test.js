const chai = require("chai");
chai.use(require("chai-string"));
chai.should();

describe('mdtk', function() {

    var mdtk;

    before(function () {
        mdtk = require("..")({
            include: ["./test/fixtures"],
            vars: {
                foo: "bar",
                fizz: "buzz",
                testInclude: "include-a.md"
            }
        });
    });

    describe('handlebars', function () {
        it('should interpolate variables', function() {
            let output = mdtk.render("foo: {{foo}}");
            output.should.containIgnoreCase("foo: bar")
        });
    });

    describe('include [<< path/to/fragment.md]', function() {

        it('should be applied recursively', function() {
            let output = mdtk.render("<<include-a.md");
            output.should.containIgnoreCase("Success")
        });

        it('should ignore whitespace before and after the path', function() {
            let output = mdtk.render("<<   include-a.md    ");
            output.should.containIgnoreCase("Success")
        });

        it('should ignore whitespace before the token', function() {
            let output = mdtk.render("   << include-a.md    ");
            output.should.containIgnoreCase("Success")
        });

        it('should only apply at block-level', function() {
            let output = mdtk.render("`<<include-a.md`");
            output.should.containIgnoreCase("&lt;include-a.md")
        });
    });

    describe('handlebars + include', function () {
        it('include should be applied before handlebars', function() {
            let output = mdtk.render("<<{{testInclude}}");
            output.should.containIgnoreSpaces("&lt;&lt;")
        });

        it('should interpolate variables in fragments', function() {
            let output = mdtk.render("foo: {{foo}}\n<< handlebars.md");
            output.should.containIgnoreSpaces("foo: bar fizz: buzz")
        });
    });

    describe('nest [using extended hr notation]', function() {

        it('all content is wrapped in a section', function() {
            let output = mdtk.render("# Hello");
            output.should.containIgnoreSpaces(`
                <section>
                    <h1>Hello</h1>
                </section>
            `)
        });

        it('--- should nest adjacent subsections 2 levels deep', function() {
            let output = mdtk.render("# Top 1\n---\n# Top 2");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <h1>Top 1</h1>
                    </section>
                    <section>
                        <h1>Top 2</h1>
                    </section>
                </section>
            `);
        });

        it('=== should nest adjacent subsections 3 levels deep', function() {
            let output = mdtk.render("# Sub 1\n===\n# Sub 2");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <section>
                            <h1>Sub 1</h1>
                        </section>
                        <section>
                            <h1>Sub 2</h1>
                        </section>
                    </section>
                </section>
            `);
        });

        it('=== should nest only adjacent subsections 2 levels deep', function() {
            let output = mdtk.render("# Top\n---\n# Sub 1\n===\n# Sub 2");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <h1>Top</h1>
                    </section>
                    <section>
                        <section>
                            <h1>Sub 1</h1>
                        </section>
                        <section>
                            <h1>Sub 2</h1>
                        </section>
                    </section>
                </section>
            `);
        });

        it('using --- after === should restore nesting back to 2 levels', function() {
            let output = mdtk.render("# Sub 1\n===\n# Sub 2\n---\n# Top");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <section>
                            <h1>Sub 1</h1>
                        </section>
                        <section>
                            <h1>Sub 2</h1>
                        </section>
                    </section>
                    <section>
                        <h1>Top</h1>
                    </section>
                </section>
            `);
        });

        it('||| should nest adjacent subsections 4 levels deep', function() {
            let output = mdtk.render("# Sub 1\n|||\n# Sub 2");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <section>
                            <section>
                                <h1>Sub 1</h1>
                            </section>
                            <section>
                                <h1>Sub 2</h1>
                            </section>
                        </section>
                    </section>
                </section>
            `);
        });

        it('||| should nest only adjacent subsections 4 levels deep', function() {
            let output = mdtk.render("# Top\n---\n# Sub 1\n|||\n# Sub 2");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <h1>Top</h1>
                    </section>
                    <section>
                        <section>
                            <section>
                                <h1>Sub 1</h1>
                            </section>
                            <section>
                                <h1>Sub 2</h1>
                            </section>
                        </section>
                    </section>
                </section>
            `);
        });

        it('using === after ||| should restore nesting back to 3 levels', function() {
            let output = mdtk.render("# Sub 1\n|||\n# Sub 2\n===\n# Top");
            output.should.containIgnoreSpaces(`
                <section>
                    <section>
                        <section>
                            <section>
                                <h1>Sub 1</h1>
                            </section>
                            <section>
                                <h1>Sub 2</h1>
                            </section>
                        </section>
                        <section>
                            <h1>Top</h1>
                        </section>
                    </section>
                </section>
            `);
        });

        it('using --- after ||| should restore nesting back to 2 levels', function() {
            let output = mdtk.render("# Sub 1\n|||\n# Sub 2\n---\n# Top");
            output.should.containIgnoreSpaces(`
            <section>
                <section>
                    <section>
                        <section>
                            <h1>Sub 1</h1>
                        </section>
                        <section>
                            <h1>Sub 2</h1>
                        </section>
                    </section>
                </section>
                <section>
                    <h1>Top</h1>
                </section>
            </section>
            `);
        });
    });

    describe("highlight.js", function () {
        it("should generate hljs DOM", function () {
            let output = mdtk.render("```bash\necho hello\n```");
            output.should.containIgnoreSpaces(`
                <pre>
                    <code class="language-bash">
                        <span class="hljs-built_in">echo</span> hello
                    </code>
                </pre>
            `);
        })
    })

});